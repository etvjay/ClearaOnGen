// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/ClearaVault.sol";
import "../contracts/ClearaFacilityManager.sol";
import "../contracts/MockBridgeAdapter.sol";

contract ClearaVaultTest is Test {
    ClearaVault vault;
    ClearaFacilityManager facility;
    MockBridgeAdapter bridge;

    address relayer = makeAddr("relayer");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address lp = makeAddr("lp");

    bytes32 constant CHAIN_BASE = keccak256("BASE_SEPOLIA");
    bytes32 constant CHAIN_SEPOLIA = keccak256("ETH_SEPOLIA");

    function setUp() public {
        vm.deal(relayer, 100 ether);
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(lp, 100 ether);
        vault = new ClearaVault(relayer);
        facility = new ClearaFacilityManager();
        bridge = new MockBridgeAdapter();
    }

    function test_DepositLocks() public {
        bytes32 id = keccak256("ob1");
        vm.prank(alice);
        vault.deposit{value: 1 ether}(id, bob, CHAIN_BASE);
        (address dep, address rec, uint256 amt, IClearaVault.ObligationState st, bytes32 ch) = vault.deposits(id);
        assertEq(dep, alice);
        assertEq(rec, bob);
        assertEq(amt, 1 ether);
        assertEq(uint8(st), uint8(IClearaVault.ObligationState.LOCKED));
        assertEq(ch, CHAIN_BASE);
    }

    function test_UnlockWithCertificate_Mode1_Netting() public {
        bytes32 id = keccak256("ob1");
        vm.prank(alice);
        vault.deposit{value: 10 ether}(id, bob, CHAIN_BASE);
        // Simulate GenLayer net: Alice deposited 10, residual 6 to Bob, 4 refund to Alice
        uint256 net = 6 ether;
        uint256 refund = 4 ether;
        bytes32 cert = keccak256("genlayer-tx-1");
        uint256 bobBefore = bob.balance;
        uint256 aliceBefore = alice.balance;
        vm.prank(relayer);
        vault.unlockWithCertificate(id, payable(bob), net, refund, cert);
        assertEq(bob.balance, bobBefore + net, "bob net");
        assertEq(alice.balance, aliceBefore + refund, "alice refund");
        (, , , IClearaVault.ObligationState st, ) = vault.deposits(id);
        assertEq(uint8(st), uint8(IClearaVault.ObligationState.SETTLED));
        // replay cert must revert
        vm.prank(relayer);
        vm.expectRevert("CLEARA: cert used");
        vault.unlockWithCertificate(id, payable(bob), 0, 0, cert);
    }

    function test_FulfillByLP_Mode2() public {
        bytes32 id = keccak256("ob2");
        address recipient = bob;
        // LP fronts 5 ether on this chain for obligation originated on other chain
        vm.prank(lp);
        vault.fulfillForCounterparty{value: 5 ether}(id, payable(recipient));
        assertEq(vault.fulfilledBy(id), lp);
        assertEq(vault.fulfilledAmount(id), 5 ether);
        // Can't fulfill again
        vm.prank(lp);
        vm.expectRevert("CLEARA: already fulfilled");
        vault.fulfillForCounterparty{value: 1 ether}(id, payable(recipient));
    }

    function test_ClaimLPCollateral_Mode2() public {
        bytes32 id = keccak256("ob3");
        // Alice deposits on this chain (collateral)
        vm.prank(alice);
        vault.deposit{value: 8 ether}(id, bob, CHAIN_SEPOLIA);
        // Simulate LP fulfilled on other chain and GenLayer cert authorizes claim
        bytes32 cert = keccak256("genlayer-lp-cert");
        uint256 lpBefore = lp.balance;
        vm.prank(relayer);
        vault.claimLPCollateral(id, payable(lp), cert);
        assertEq(lp.balance, lpBefore + 8 ether, "lp claim");
        (, , , IClearaVault.ObligationState st, ) = vault.deposits(id);
        assertEq(uint8(st), uint8(IClearaVault.ObligationState.SETTLED));
    }

    function test_RouteResidual_Mode3() public {
        bytes32 id = keccak256("ob4");
        vm.prank(alice);
        vault.deposit{value: 3 ether}(id, bob, CHAIN_BASE);
        vm.prank(relayer);
        vault.routeResidual(id, address(bridge));
        (, , , IClearaVault.ObligationState st, ) = vault.deposits(id);
        assertEq(uint8(st), uint8(IClearaVault.ObligationState.ROUTED));
        assertEq(address(bridge).balance, 3 ether, "bridge holds");
    }

    function test_Revert_OnlyRelayer() public {
        bytes32 id = keccak256("ob5");
        vm.prank(alice);
        vault.deposit{value: 1 ether}(id, bob, CHAIN_BASE);
        vm.prank(bob);
        vm.expectRevert("CLEARA: not relayer");
        vault.unlockWithCertificate(id, payable(bob), 1 ether, 0, keccak256("cert"));
    }

    function test_FacilityManager() public {
        facility.registerLP(lp);
        assertTrue(facility.isLP(lp));
        facility.assignFacility(keccak256("obX"), lp);
        assertEq(facility.getLP(keccak256("obX")), lp);
    }

    // =========================================================================
    // === EXPLICIT END-TO-END SUITE FOR ALL THREE SETTLEMENT MODES ===
    // =========================================================================

    /// @notice Mode 1: Bilateral Reciprocal Netting (Gross -> Net)
    /// Alice owes Bob 1.0 ETH; Bob owes Alice 0.6 ETH.
    /// Result: 0.4 ETH net to Bob, 0.6 ETH refund to Alice. Zero bridge exposure.
    function test_Mode1_BilateralNetting_EndToEnd() public {
        ClearaVault sepVault = vault; // Sepolia vault
        ClearaVault baseVault = new ClearaVault(relayer); // Base Sepolia vault

        bytes32 obl1 = keccak256("obl-1-sepolia");
        bytes32 obl2 = keccak256("obl-2-base");

        // Step 1: Alice locks 1.0 ETH on Sepolia for Bob
        vm.prank(alice);
        sepVault.deposit{value: 1.0 ether}(obl1, bob, CHAIN_BASE);
        (, , uint256 amt1, IClearaVault.ObligationState st1, ) = sepVault.deposits(obl1);
        assertEq(amt1, 1.0 ether);
        assertEq(uint8(st1), uint8(IClearaVault.ObligationState.LOCKED));

        // Step 2: Bob locks 0.6 ETH on Base for Alice
        vm.prank(bob);
        baseVault.deposit{value: 0.6 ether}(obl2, alice, CHAIN_SEPOLIA);
        (, , uint256 amt2, IClearaVault.ObligationState st2, ) = baseVault.deposits(obl2);
        assertEq(amt2, 0.6 ether);
        assertEq(uint8(st2), uint8(IClearaVault.ObligationState.LOCKED));

        // Step 3: GenLayer AI consensus calculates net = 0.4 ETH, direction = A_OWES_B
        uint256 netResidual = 0.4 ether;
        uint256 localRefund = 0.6 ether;
        bytes32 genlayerCert = keccak256("genlayer-mode1-cert");

        uint256 bobSepBalanceBefore = bob.balance;
        uint256 aliceSepBalanceBefore = alice.balance;

        // Step 4: Relayer executes unlock on Sepolia Vault
        vm.prank(relayer);
        sepVault.unlockWithCertificate(obl1, payable(bob), netResidual, localRefund, genlayerCert);

        assertEq(bob.balance, bobSepBalanceBefore + netResidual, "Bob receives 0.4 ETH net residual");
        assertEq(alice.balance, aliceSepBalanceBefore + localRefund, "Alice receives 0.6 ETH local refund");

        (, , , IClearaVault.ObligationState st1After, ) = sepVault.deposits(obl1);
        assertEq(uint8(st1After), uint8(IClearaVault.ObligationState.SETTLED));
    }

    /// @notice Mode 2: Facility / LP Fronting & Collateral Claim
    /// Alice needs urgent settlement on Base; LP fronts liquidity locally;
    /// LP claims Alice's deposited collateral on Sepolia via GenLayer certificate.
    function test_Mode2_FacilityLPFronting_EndToEnd() public {
        ClearaVault sepVault = vault;
        ClearaVault baseVault = new ClearaVault(relayer);

        bytes32 oblMode2 = keccak256("obl-mode2-urgent");

        // 1. Facility Manager registers LP
        facility.registerLP(lp);
        facility.assignFacility(oblMode2, lp);
        assertTrue(facility.isLP(lp));
        assertEq(facility.getLP(oblMode2), lp);

        // 2. Alice deposits 2.0 ETH collateral on Sepolia Vault
        vm.prank(alice);
        sepVault.deposit{value: 2.0 ether}(oblMode2, bob, CHAIN_BASE);
        (, , uint256 lockedAmt, IClearaVault.ObligationState lockSt, ) = sepVault.deposits(oblMode2);
        assertEq(lockedAmt, 2.0 ether);
        assertEq(uint8(lockSt), uint8(IClearaVault.ObligationState.LOCKED));

        // 3. LP fronts 2.0 ETH directly to Bob on Base Sepolia Vault
        uint256 bobBaseBefore = bob.balance;
        vm.prank(lp);
        baseVault.fulfillForCounterparty{value: 2.0 ether}(oblMode2, payable(bob));

        assertEq(bob.balance, bobBaseBefore + 2.0 ether, "Bob receives fronted liquidity instantly");
        assertEq(baseVault.fulfilledBy(oblMode2), lp, "Vault records LP address");
        assertEq(baseVault.fulfilledAmount(oblMode2), 2.0 ether, "Vault records fronted amount");

        // 4. GenLayer verifies Base receipt and issues LP claim certificate
        bytes32 lpCert = keccak256("genlayer-mode2-lp-fulfillment-cert");

        // 5. Relayer executes claimLPCollateral on Sepolia Vault to reimburse LP
        uint256 lpSepBefore = lp.balance;
        vm.prank(relayer);
        sepVault.claimLPCollateral(oblMode2, payable(lp), lpCert);

        assertEq(lp.balance, lpSepBefore + 2.0 ether, "LP reimbursed from locked collateral");
        (, , , IClearaVault.ObligationState lockStAfter, ) = sepVault.deposits(oblMode2);
        assertEq(uint8(lockStAfter), uint8(IClearaVault.ObligationState.SETTLED));
    }

    /// @notice Mode 3: Residual Bridge Routing
    /// For unnetted residual obligations that cannot be settled locally or fronted by LP.
    /// The vault dispatches the exact residual to canonical bridge adapter.
    function test_Mode3_ResidualBridgeRouting_EndToEnd() public {
        ClearaVault sepVault = vault;
        bytes32 oblMode3 = keccak256("obl-mode3-residual");

        // 1. Alice locks 1.5 ETH collateral on Sepolia
        vm.prank(alice);
        sepVault.deposit{value: 1.5 ether}(oblMode3, bob, CHAIN_BASE);
        (, , uint256 lockedAmt, IClearaVault.ObligationState lockSt, ) = sepVault.deposits(oblMode3);
        assertEq(lockedAmt, 1.5 ether);
        assertEq(uint8(lockSt), uint8(IClearaVault.ObligationState.LOCKED));

        // 2. Relayer routes residual to MockBridgeAdapter
        vm.prank(relayer);
        sepVault.routeResidual(oblMode3, address(bridge));

        // 3. Verify bridge received collateral and state transitioned to ROUTED
        (, , , IClearaVault.ObligationState lockStAfter, ) = sepVault.deposits(oblMode3);
        assertEq(uint8(lockStAfter), uint8(IClearaVault.ObligationState.ROUTED));
        assertEq(address(bridge).balance, 1.5 ether, "Bridge adapter custody verified");
    }
}
