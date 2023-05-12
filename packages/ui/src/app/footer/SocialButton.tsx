import { chakra, useColorModeValue, VisuallyHidden } from "@chakra-ui/react";
import { FC } from "react";

export interface SocialButtonProps {
    children?: React.ReactNode;
    label: string;
    href: string;
}

export const SocialButton: FC<SocialButtonProps> = ({ children, label, href }): JSX.Element => {
    return (
        <chakra.button
            bg={useColorModeValue("blackAlpha.100", "whiteAlpha.100")}
            rounded={"full"}
            w={8}
            h={8}
            cursor={"pointer"}
            as={"a"}
            href={href}
            display={"inline-flex"}
            alignItems={"center"}
            justifyContent={"center"}
            transition={"background 0.3s ease"}
            _hover={{
                bg: useColorModeValue("blackAlpha.200", "whiteAlpha.200"),
            }}
        >
            <VisuallyHidden>{label}</VisuallyHidden>
            {children}
        </chakra.button>
    );
};
