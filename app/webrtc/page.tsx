// "use client"

// import React from "react"
// import CallWidget from "@/components/webrtc/CallWidget"

// export default function Page() {
//   return (
//     <div>
//       <CallWidget />
//     </div>
//   )
// }

import React, { Suspense } from "react"
import CallWidget from "@/components/webrtc/CallWidget"

export default function Page() {
  return (
    <div>
      <Suspense fallback={<div /> }>
        <CallWidget />
      </Suspense>
    </div>
  )
}
