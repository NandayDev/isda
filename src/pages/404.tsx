import { FunctionComponent } from "react";
import GlobalWrapper from "components/GlobalWrapper";
import { Text } from "@chakra-ui/react";

const Page404: FunctionComponent = () => {
  return (
    <GlobalWrapper
      withoutHeader
      alignItems={"center"}
      justifyContent={"center"}
    >
      <Text fontSize={"8xl"} fontWeight={"medium"}>
        404
      </Text>
      <Text fontSize={"2xl"}>&quot;Dai, dai dai!&quot;</Text>
    </GlobalWrapper>
  );
};

export default Page404;
