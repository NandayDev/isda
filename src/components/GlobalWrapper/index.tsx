import { FunctionComponent, ReactNode } from "react";
import Head from "next/head";
import { Flex, FlexProps, useColorModeValue } from "@chakra-ui/react";
import Header from "components/GlobalWrapper/Header";

interface GlobalWrapperProps extends FlexProps {
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
      <Flex
        as={"main"}
        bg={useColorModeValue("gray.100", "gray.900")}
        flexDirection={"column"}
        height={"100%"}
        {...rest}
      >
        {!withoutHeader && <Header />}
        {children}
      </Flex>
    </>
  );
};

export default GlobalWrapper;
