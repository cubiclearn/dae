import { useNetwork, useAccount } from "wagmi";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useTeacherCourses() {
    const { chain } = useNetwork();
    const { address } = useAccount();

    const { data, error, isLoading } = useSWR(() => `/api/v1/teacher/${address}/courses?chainId=${chain?.id}`, fetcher);

    return {
        data,
        isLoading,
        error,
    };
}
