import { NextPage } from "next";
import GlobalWrapper from "components/GlobalWrapper";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { ChangeEvent, MouseEvent, useState } from "react";
import useSupabaseQuery from "network/useSupabaseQuery";
import { useRouter } from "next/router";
import ROUTES from "routes";

const SignIn: NextPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: signIn, isLoading: isSignInLoading } =
    useSupabaseQuery.postSignInWithPassword({
      onSuccess: () => {
        router.replace(ROUTES.HOME);
      },
    });

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (event: MouseEvent) => {
    event.preventDefault();

    signIn({ email, password });
  };

  return (
    <GlobalWrapper
      withoutHeader
      alignItems={"center"}
      justifyContent={"center"}
      gap={6}
    >
      <Text fontSize={"4xl"} fontWeight={"bold"} align={"center"}>
        Sign in
      </Text>
      <Flex
        bg={useColorModeValue("white", "black")}
        borderRadius={"xl"}
        flexDirection={"column"}
        gap={4}
        mx={4}
        px={8}
        py={6}
        w={["sm", "md"]}
      >
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input
            type={"email"}
            placeholder={"asd@gmail.com"}
            onChange={handleEmailChange}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input
            type={"password"}
            placeholder={"***********"}
            onChange={handlePasswordChange}
          />
        </FormControl>
        <Button
          colorScheme={"teal"}
          onClick={handleSubmit}
          isLoading={isSignInLoading}
        >
          Sign in
        </Button>
      </Flex>
    </GlobalWrapper>
  );
};

export default SignIn;
