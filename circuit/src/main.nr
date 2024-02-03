use dep::std;

fn main(
    root: pub Field,
    nullifierHash: pub Field,
    index: Field,
    hash_path: [Field; 6],
    otp: Field,
    timestep: pub Field // time step value. block.timestamp / 180
) {
    // std::println(otp);
    // std::println(timestep);
    let leaf = std::hash::pedersen_hash([otp, timestep]);
    // std::println(leaf);

    let computed_root = std::merkle::compute_merkle_root(leaf, index, hash_path);
    // std::println(computed_root);
    assert(computed_root == root);

    // Compute input note nullifier
    let nullifier = std::hash::pedersen_hash([leaf, otp, timestep]);
    // std::println(nullifier);
    assert(nullifierHash == nullifier);
}

// #[test]
// fn test_main() {
//     let root = 0x1409f19b761c2a71f6c4529b33a05681919130a08918b24c70fc46eb8059b9f7;

//     let nullifierHash = 0x110d068268259c96e26d5ef04239677fd9cc29abefa77e8590dc8e44e81f6438;

//     let index = 0;

//     let hash_path: [Field; 2] = [
//         0x2ad173d9b46d8ce268953bf927f489257b279e267a0e8b5f1469ef5d7d90d9b2,
//         0x2f216bffaf1461ae5673148f1cd0269f3897b8f44055fd5b484510c4fb713337
//     ];

//     let otp = 639151;
//     let timestep = 9482698;

//     main(root, nullifierHash, index, hash_path, otp, timestep);
// }
