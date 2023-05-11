"use client";

import { useSession } from "next-auth/react";

export default function Page() {
    const { data, status } = useSession();
    console.log(status, data);

    return (
        <>
            <div>Test</div>
        </>
    );
}
