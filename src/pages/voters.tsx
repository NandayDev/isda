import { NextPage } from "next";
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
  Select,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { VoterType } from "@prisma/client";
import { capitalizeFirstLetter } from "utils/string";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import Image from "next/image";
import useVoterQuery from "network/useVoterQuery";

const Voters: NextPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [image, setImage] = useState<string | undefined>(undefined);

  const { mutate: postVoter, isLoading: isPostVoterLoading } =
    useVoterQuery.postVoter({
      onSuccess: () => {
        onClose();
        setImage(undefined);
      },
    });

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
    const type = formData.get("type") as VoterType;

    postVoter({ name, type, image });
  };

  return (
    <GlobalWrapper>
      <Flex
        alignItems={"center"}
        justifyContent={"space-between"}
        gap={4}
        w={"full"}
      >
        <Text fontSize={"4xl"} fontWeight={"bold"}>
          Votanti
        </Text>
        <Button colorScheme={"teal"} size={"sm"} onClick={onOpen}>
          <AddIcon mr={2} />
          Aggiungi votante
        </Button>
      </Flex>
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
                  name={"name"}
                  placeholder={"Pinco Pallino"}
                  type={"text"}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Tipo</FormLabel>
                <Select required name={"type"}>
                  {Object.keys(VoterType).map((type) => (
                    <option key={type} value={type}>
                      {capitalizeFirstLetter(type.toLowerCase())}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <Text fontWeight={"medium"} mb={2}>
                  Immagine (quadrata, 200x200)
                </Text>
                {image && (
                  <Image
                    src={image}
                    alt={"Voter image"}
                    width={200}
                    height={200}
                  />
                )}
                <Button
                  colorScheme={"teal"}
                  mt={image ? 2 : 0}
                  onClick={onAddImageButtonClick}
                >
                  {image ? "Cambia immagine" : "Aggiungi immagine"}
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
              <Button
                colorScheme={"teal"}
                isLoading={isPostVoterLoading}
                type={"submit"}
              >
                Aggiungi
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </GlobalWrapper>
  );
};

export default Voters;
