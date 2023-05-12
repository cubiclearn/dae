import { FC } from "react";
import { Box } from "@chakra-ui/react";
import { Header } from "../app/header";

type Props = {
    children: React.ReactNode;
};

export const PageLayout: FC<Props> = ({ children }): JSX.Element => {
    return (
        <Box position={"absolute"} top={"80px"}>
            <Box>{children}</Box>
        </Box>
    );
};
