import { FunctionComponent } from "react";
import {
  Container,
  Flex,
  Link,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

const Footer: FunctionComponent = () => {
  return (
    <Flex mt={4} py={4} backgroundColor={useColorModeValue("white", "black")}>
      <Container display={"flex"} justifyContent={"space-between"} maxW={"8xl"}>
        <Text>
          Made with ♥️ by{" "}
          <Link
            href={"https://igorzanella.dev"}
            textDecoration={"underline"}
            target={"_blank"}
            rel={"noopener"}
          >
            Igor Zanella
          </Link>
        </Text>
        <Text>
          © {new Date().getFullYear()}{" "}
          <Link
            href={"https://retireinprogress.com"}
            textDecoration={"underline"}
            target={"_blank"}
            rel={"noopener"}
          >
            RetireInProgress
          </Link>
          . All rights reserved.
        </Text>
      </Container>
    </Flex>
  );
};

export default Footer;
