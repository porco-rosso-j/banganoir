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

#[test]
fn test_main() {
    let root = 0x054be3e86a2ccc9689b491bcd1c0ff71bb267f953d45e6bb2171f50a9da3f55a;

    let nullifierHash = 0x229a5c94d1a2531a546bd9d791a40d418a724cfb1bd163e21811707000297097;

    let index = 1;

    let hash_path: [Field; 6] = [
        0x26895d31feb61c575092c6e33ee9bca4227cefdf18df11abcf12db67cfab65ba,
        0x0e94145a184ca0073db3c5ba821289bffef0b4c9d96f61839714cc88f1e910dd,
        0x0900f3c14feca5b92d7bd733e0663a7ed3a1106416dc81f4bd348a634c19ba0e,
        0x08e4dfdd53de8665d02c380664e11f1bdd95fb1a53eb93f467f7d1f4bf3648b1,
        0x052df258e0c8d44aa31459482a902ff2d0f239a24775eee493763f0141b704c9,
        0x271dbd4080e76ca78a493a486a7d18bb43a38d140d1ea5cd2e594e748a79297d
    ];

    let otp = 426939;
    let timestep = 9490425;

    // below also work
    // let otp = 0x0683bb;
    // let timestep = 0x90cff9;

    main(root, nullifierHash, index, hash_path, otp, timestep);
}
