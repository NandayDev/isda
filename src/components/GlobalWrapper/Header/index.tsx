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
import NextLink from "next/link";
import useSupabaseQuery from "network/useSupabaseQuery";
import { PRIVATE_ROUTES, ROUTES } from "middleware";

const Header: FunctionComponent = () => {
  const router = useRouter();

  const { data: session, isLoading: isSessionLoading } =
    useSupabaseQuery.getSession();

  const { mutate: signOut, isLoading: isSignOutLoading } =
    useSupabaseQuery.postSignout({
      onSuccess: () => {
        if (PRIVATE_ROUTES.includes(router.pathname)) {
          router.replace(ROUTES.HOME);
        }
      },
    });

  const isLoggedIn = !!session?.data.session;

  const handleLogout = () => {
    signOut();
  };

  return (
    <Flex
      as={"header"}
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
            <Flex gap={4}>
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
              {isLoggedIn && (
                <>
                  <Link
                    as={NextLink}
                    href={ROUTES.VOTE}
                    fontWeight={
                      router.pathname === ROUTES.VOTE ? "semibold" : "normal"
                    }
                    _hover={{ textDecoration: "none", fontWeight: "semibold" }}
                  >
                    Vota
                  </Link>
                  <Link
                    as={NextLink}
                    href={ROUTES.VOTERS}
                    fontWeight={
                      router.pathname === ROUTES.VOTERS ? "semibold" : "normal"
                    }
                    _hover={{ textDecoration: "none", fontWeight: "semibold" }}
                  >
                    Votanti
                  </Link>
                </>
              )}
            </Flex>
            {isSessionLoading ? (
              <Button isLoading>Sign in</Button>
            ) : isLoggedIn ? (
              <Button
                variant={"outline"}
                onClick={handleLogout}
                isLoading={isSignOutLoading}
              >
                Logout
              </Button>
            ) : (
              <Button as={NextLink} href={ROUTES.SIGNIN}>
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
