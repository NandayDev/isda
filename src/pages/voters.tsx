import { GetStaticProps, NextPage } from "next";
import GlobalWrapper from "components/GlobalWrapper";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { PrismaClient, Voter } from "@prisma/client";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import useVoterQuery, { VOTERS_QUERY_KEY } from "network/useVoterQuery";
import { createColumnHelper } from "@tanstack/table-core";
import Head from "next/head";
import { dehydrate, QueryClient } from "@tanstack/query-core";
import { createClient } from "@supabase/supabase-js";
import Table from "components/Table";

const columnHelper = createColumnHelper<Voter>();

const Voters: NextPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [image, setImage] = useState<string | undefined>(undefined);
  const [editVoter, setEditVoter] = useState<Voter>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("image", {
        header: "",
        cell: (props) => {
          const imageSrc = props.getValue();

          return imageSrc ? (
            <Image
              src={imageSrc}
              alt={props.row.original.name}
              width={150}
              height={150}
            />
          ) : (
            <></>
          );
        },
      }),
      columnHelper.accessor("name", {
        header: "Nome",
      }),
      columnHelper.accessor("createdAt", {
        header: "Creato il",
        cell: (props) => new Date(props.getValue()).toLocaleDateString("it"),
      }),
      columnHelper.display({
        id: "actions",
        cell: (props) => {
          const voter = props.row.original;

          return (
            <Flex flexDirection={"column"} gap={2}>
              <Button
                size={"sm"}
                variant={"outline"}
                onClick={() => {
                  setEditVoter(voter);
                  onOpen();
                }}
              >
                Modifica
              </Button>
              <Button
                colorScheme={"red"}
                size={"sm"}
                variant={"outline"}
                isLoading={isDeleteVoterLoading}
                onClick={() => {
                  deleteVoter({ id: voter.id });
                }}
              >
                Elimina
              </Button>
            </Flex>
          );
        },
      }),
    ],
    []
  );

  const { data: voters, isLoading: isVotersLoading } =
    useVoterQuery.getVoters();
  const { mutate: postVoter, isLoading: isPostVoterLoading } =
    useVoterQuery.postVoter({
      onSuccess: () => {
        onClose();
        setImage(undefined);
      },
    });

  const { mutate: putVoter, isLoading: isPutVoterLoading } =
    useVoterQuery.putVoter({
      onSuccess: () => {
        onClose();
        setImage(undefined);
      },
    });
  const { mutate: deleteVoter, isLoading: isDeleteVoterLoading } =
    useVoterQuery.deleteVoter();

  const imageInputRef = useRef<HTMLInputElement>(null);

  const onAddImageButtonClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const image = event.target?.result as string;
      setImage(image);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;

    if (editVoter) {
      putVoter({ id: editVoter.id, name, image });
    } else {
      postVoter({ name, image });
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setEditVoter(undefined);
    }
  }, [isOpen]);

  return (
    <GlobalWrapper>
      <Head>
        <title>Votanti</title>
      </Head>
      <Flex
        alignItems={"center"}
        justifyContent={"space-between"}
        gap={4}
        w={"full"}
      >
        <Text fontSize={"4xl"} fontWeight={"bold"}>
          Votanti
        </Text>
        <Button size={"sm"} onClick={onOpen}>
          <AddIcon mr={2} />
          Aggiungi votante
        </Button>
      </Flex>
      <Table data={voters || []} columns={columns} mt={4} />
      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleFormSubmit}>
            <ModalHeader>Aggiungi votante</ModalHeader>
            <ModalCloseButton />
            <ModalBody display={"flex"} flexDirection={"column"} gap={2}>
              <FormControl>
                <FormLabel>Nome</FormLabel>
                <Input
                  required
                  defaultValue={editVoter?.name}
                  name={"name"}
                  placeholder={"Pinco Pallino"}
                  type={"text"}
                />
              </FormControl>
              <FormControl>
                <Text fontWeight={"medium"} mb={2}>
                  Immagine (quadrata, 200x200)
                </Text>
                {(image || editVoter?.image) && (
                  <Image
                    src={image || (editVoter?.image as string)}
                    alt={"Voter image"}
                    width={200}
                    height={200}
                  />
                )}
                <Button
                  mt={image || editVoter?.image ? 2 : 0}
                  onClick={onAddImageButtonClick}
                >
                  {image || editVoter?.image
                    ? "Cambia immagine"
                    : "Aggiungi immagine"}
                </Button>
                <Input
                  accept={"image/*"}
                  aria-hidden={"true"}
                  name={"image"}
                  onChange={handleImageChange}
                  ref={imageInputRef}
                  position={"absolute"}
                  type={"file"}
                  visibility={"hidden"}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter gap={2}>
              <Button variant={"ghost"} onClick={onClose}>
                Chiudi
              </Button>
              <Button isLoading={isPostVoterLoading} type={"submit"}>
                {editVoter ? "Modifica" : "Aggiungi"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </GlobalWrapper>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const queryClient = new QueryClient();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      auth: { persistSession: false },
    }
  );

  const prisma = new PrismaClient();
  const voters = await prisma.voter.findMany();

  queryClient.setQueryData(
    [VOTERS_QUERY_KEY],
    voters.map((voter) => ({
      ...voter,
      image:
        voter.image &&
        supabase.storage
          .from(process.env.SUPABASE_STORAGE_VOTERS_IMAGES_BUCKET as string)
          .getPublicUrl(voter.image).data.publicUrl,
    }))
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default Voters;
