"use client";

import { FunctionComponent } from "react";
import {
  Button,
  Container,
  Flex,
  Link,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import ROUTES from "routes";
import NextLink from "next/link";
import useSupabaseQuery from "network/useSupabaseQuery";

const Header: FunctionComponent = () => {
  const router = useRouter();

  const { data: session, isLoading: isSessionLoading } =
    useSupabaseQuery.getSession();

  const { mutate: signOut, isLoading: isSignOutLoading } =
    useSupabaseQuery.postSignout();

  const handleLogout = () => {
    signOut();
  };

  return (
    <Flex
      alignItems={"center"}
      bg={useColorModeValue("white", "black")}
      px={4}
      py={3}
    >
      <Container maxW={"8xl"}>
        <Flex alignItems={"center"} gap={6}>
          <Text as={"h1"} fontSize={"xl"} fontWeight={"medium"}>
            I Soldi degli Altri
          </Text>
          <Flex flex={1} alignItems={"center"} justifyContent={"space-between"}>
            <Flex>
              <Link
                as={NextLink}
                href={ROUTES.HOME}
                fontWeight={
                  router.pathname === ROUTES.HOME ? "semibold" : "normal"
                }
                _hover={{ textDecoration: "none", fontWeight: "semibold" }}
              >
                Classifica
              </Link>
            </Flex>
            {isSessionLoading ? (
              <Button isLoading colorScheme={"teal"}>
                Sign in
              </Button>
            ) : session?.data.session ? (
              <Button
                colorScheme={"teal"}
                variant={"outline"}
                onClick={handleLogout}
                isLoading={isSignOutLoading}
              >
                Logout
              </Button>
            ) : (
              <Button as={NextLink} colorScheme={"teal"} href={ROUTES.SIGNIN}>
                Sign in
              </Button>
            )}
          </Flex>
        </Flex>
      </Container>
    </Flex>
  );
};

export default Header;
