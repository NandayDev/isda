import { FunctionComponent, ReactNode } from "react";
import Head from "next/head";
import {
  Container,
  ContainerProps,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import Header from "components/GlobalWrapper/Header";

interface GlobalWrapperProps extends ContainerProps {
  children: ReactNode;
  withoutHeader?: boolean;
}

const GlobalWrapper: FunctionComponent<GlobalWrapperProps> = ({
  children,
  withoutHeader,
  ...rest
}) => {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {!withoutHeader && <Header />}
      <Flex
        as={"main"}
        bg={useColorModeValue("gray.100", "gray.900")}
        height={"calc(100% - 64px)"}
      >
        <Container
          display={"flex"}
          flexDirection={"column"}
          maxW={"8xl"}
          py={4}
          {...rest}
        >
          {children}
        </Container>
      </Flex>
    </>
  );
};

export default GlobalWrapper;
