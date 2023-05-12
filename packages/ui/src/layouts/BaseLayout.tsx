import { FC } from "react";
import {
    Box,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    useDisclosure,
} from "@chakra-ui/react";
import { Header } from "../app/header";
import { NavItem } from "./DrawerNavItem";
import { IconType } from "react-icons";

type NavItemChildProps = {
    name: string;
    icon: IconType;
    href: string;
};

type Props = {
    children: React.ReactNode;
    navItems?: NavItemChildProps[];
};

export const BaseLayout: FC<Props> = ({ children, navItems = [] }): JSX.Element => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    if (navItems.length == 0) {
        return (
            <main>
                <Header onOpen={onOpen} showDrawerButton={false}></Header>
                <Box position={"absolute"} top={"80px"}>
                    <Box>{children}</Box>
                </Box>
            </main>
        );
    }

    return (
        <main>
            <Header onOpen={onOpen} showDrawerButton={true}></Header>
            <Drawer
                autoFocus={false}
                isOpen={isOpen}
                placement="left"
                onClose={onClose}
                returnFocusOnClose={false}
                onOverlayClick={onClose}
                size="xs"
            >
                <DrawerOverlay />
                <DrawerContent>
                    {/* <SidebarContent onClose={onClose} /> */}
                    <DrawerCloseButton />
                    <DrawerHeader>MENU</DrawerHeader>
                    <DrawerBody>
                        {navItems.map((navItem) => (
                            <NavItem key={navItem.name} icon={navItem.icon} href={navItem.href}>
                                {navItem.name}
                            </NavItem>
                        ))}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            <Box position={"absolute"} top={"80px"}>
                <Box>{children}</Box>
            </Box>
        </main>
    );
};
