//
//  Copyright 2022 Readium Foundation. All rights reserved.
//  Use of this source code is governed by the BSD-style license
//  available in the top-level LICENSE file of the project.
//

import XCTest

func AssertJSONEqual(_ json1: Any, _ json2: Any, file: StaticString = #file, line: UInt = #line) {
    guard #available(iOS 11.0, *) else {
        XCTFail("iOS 11 is required to run JSON tests")
        return
    }
    
    do {
        // Wrap the objects in an array to allow JSON fragments comparisons
        let d1 = String(data: try JSONSerialization.data(withJSONObject: [json1], options: .sortedKeys), encoding: .utf8)
        let d2 = String(data: try JSONSerialization.data(withJSONObject: [json2], options: .sortedKeys), encoding: .utf8)
        XCTAssertEqual(d1, d2, file: file, line: line)
    } catch {
        XCTFail(error.localizedDescription)
    }
}

func AssertImageEqual(_ image1: UIImage?, _ image2: UIImage?, file: StaticString = #file, line: UInt = #line) {
    XCTAssertEqual(image1?.pngData(), image2?.pngData(), file: file, line: line)
}
