import { Flex, useColorModeValue, HStack, Link } from "@chakra-ui/react";
import { ConnectButton } from "./ConnectButton";
import NextLink from "next/link";

export const Header = ({ ...rest }): JSX.Element => {
    return (
        <Flex
            px={8}
            height="20"
            alignItems="center"
            bg={useColorModeValue("white", "gray.900")}
            borderBottomWidth="1px"
            borderBottomColor={useColorModeValue("gray.300", "gray.700")}
            borderStyle={"dashed"}
            justifyContent={"space-between"}
            width={"100%"}
            zIndex={"sticky"}
            as="header"
            position={"fixed"}
            {...rest}
        >
            <Link display={"flex"} fontSize={"2xl"} fontFamily="monospace" fontWeight="bold" href="/" as={NextLink}>
                DAE
            </Link>

            <HStack spacing={{ base: "0", md: "6" }}>
                <Flex alignItems={"center"}>
                    <ConnectButton />
                </Flex>
            </HStack>
        </Flex>
    );
};
