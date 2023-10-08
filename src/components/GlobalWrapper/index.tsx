import { FunctionComponent, ReactNode } from "react";
import Head from "next/head";
import {
  Container,
  ContainerProps,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import Header from "components/GlobalWrapper/Header";
import Footer from "components/GlobalWrapper/Footer";

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
        direction={"column"}
        minHeight={withoutHeader ? "100%" : "calc(100% - 64px)"}
      >
        <Container
          display={"flex"}
          flexDirection={"column"}
          flex={"1"}
          maxW={"8xl"}
          pt={4}
          {...rest}
        >
          {children}
        </Container>
        <Footer />
      </Flex>
    </>
  );
};

export default GlobalWrapper;
