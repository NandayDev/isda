import { FunctionComponent } from "react";
import {
  Container,
  Flex,
  Link,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import GitHubIcon from "@mui/icons-material/GitHub";

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
          Want to contribute?{" "}
          <Link
            href={"https://github.com/NandayDev/isda"}
            textDecoration={"underline"}
            target={"_blank"}
            rel={"noopener"}
          >
            GitHub
          </Link>{" "}
          <GitHubIcon sx={{ verticalAlign: "bottom" }} />
        </Text>
      </Container>
    </Flex>
  );
};

export default Footer;
