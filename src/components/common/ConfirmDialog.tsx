import React from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogRoot,
  DialogPositioner,
} from "@chakra-ui/react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;

  onClose: () => void;
  onConfirm: () => void;

  confirmText?: string;
  cancelText?: string;

  confirmColor?: string;

  icon?: React.ReactNode;

  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "Yes",
  cancelText = "Cancel",
  confirmColor = "blue.500",
  icon,
  loading = false,
}) => {
  return (
    <>
      {open && (
        <Box
          position="fixed"
          inset={0}
          bg="blackAlpha.400"
          zIndex={1399}
          onClick={onClose}
        />
      )}

      <DialogRoot
        open={open}
        onOpenChange={(e) => {
          if (!e.open) {
            onClose();
          }
        }}
        placement="center"
        size="sm"
      >
        <DialogPositioner
          position="fixed"
          inset={0}
          zIndex={1400}
          display="flex"
          alignItems="center"
          justifyContent="center"
          pointerEvents="none"
        >
          <DialogContent
            pointerEvents="auto"
            bg="white"
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="0 8px 40px rgba(0,0,0,0.12)"
            maxW="360px"
            w="full"
            mx={4}
          >
            <DialogBody pt={5} pb={3}>
              <Flex direction="column" align="center" gap={3}>
                {icon && (
                  <Flex
                    w="56px"
                    h="56px"
                    borderRadius="full"
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.100"
                    justify="center"
                    align="center"
                  >
                    {icon}
                  </Flex>
                )}

                <Text
                  fontSize="15px"
                  fontWeight="600"
                  color="gray.700"
                  textAlign="center"
                >
                  {title}
                </Text>

                <Text
                  fontSize="13px"
                  color="gray.500"
                  textAlign="center"
                  lineHeight="1.7"
                >
                  {message}
                </Text>
              </Flex>
            </DialogBody>

            <DialogFooter gap={2} px={5} pb={5}>
              <Button
                flex={1}
                variant="outline"
                borderColor="gray.200"
                color="gray.500"
                borderRadius="lg"
                onClick={onClose}
              >
                {cancelText}
              </Button>

              <Button
                flex={1}
                bg={confirmColor}
                color="white"
                borderRadius="lg"
                loading={loading}
                onClick={onConfirm}
              >
                {confirmText}
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>
    </>
  );
};

export default ConfirmDialog;
