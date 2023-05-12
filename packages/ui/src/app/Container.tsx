export interface ContainerProps {
    children?: React.ReactNode;
}

export function Container({ children }: ContainerProps): JSX.Element {
    return <main>{children}</main>;
}
