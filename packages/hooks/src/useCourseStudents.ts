import { useEffect, useState } from "react";
import { useNetwork } from "wagmi";
import useSWR, { Fetcher } from "swr";

const fetcher: Fetcher<any, string> = (url: string) => fetch(url).then((r) => r.json());

export function useCourseStudents(address: string | undefined) {
    const [isLoading, setIsLoading] = useState(true);

    const { chain } = useNetwork();

    const { data, error } = useSWR(
        address !== undefined ? `/api/v1/course/${address}/students?chainId=${chain?.id}` : null,
        fetcher
    );

    useEffect(() => {
        if (data || error) {
            setIsLoading(false);
        }
    }, [data, error]);

    return {
        data,
        isLoading,
        error,
    };
}
