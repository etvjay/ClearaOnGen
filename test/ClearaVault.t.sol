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
}
