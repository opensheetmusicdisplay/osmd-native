// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "osmd-swift",
    products: [
        // Products define the executables and libraries a package produces, making them visible to other packages.
        .library(
            name: "osmd-swift",
            targets: ["osmd-swift"]),
    ],
    dependencies: [
        .package(url: "https://github.com/yene/GCDWebServer", from: "3.5.7")
    ],
    targets: [
        // Targets are the basic building blocks of a package, defining a module or a test suite.
        // Targets can depend on other targets in this package and products from dependencies.
        .target(
            name: "osmd-swift",
        dependencies: ["GCDWebServer"],
        path: "Sources"),
        .testTarget(
            name: "osmd-swiftTests",
            dependencies: ["osmd-swift"]),
    ]
)
