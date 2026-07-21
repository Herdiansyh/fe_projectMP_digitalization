// import React from "react";
// import {
//   Box,
//   Button,
//   Flex,
//   Text,
//   DialogBody,
//   DialogContent,
//   DialogFooter,
//   DialogRoot,
//   DialogPositioner,
// } from "@chakra-ui/react";

// interface ConfirmDialogProps {
//   open: boolean;
//   title: string;
//   message: React.ReactNode;

//   onClose: () => void;
//   onConfirm: () => void;

//   confirmText?: string;
//   cancelText?: string;

//   confirmColor?: string;

//   icon?: React.ReactNode;

//   loading?: boolean;
// }

// const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
//   open,
//   title,
//   message,
//   onClose,
//   onConfirm,
//   confirmText = "Yes",
//   cancelText = "Cancel",
//   confirmColor = "blue.500",
//   icon,
//   loading = false,
// }) => {
//   return (
//     <>
//       {open && (
//         <Box
//           position="fixed"
//           inset={0}
//           bg="blackAlpha.400"
//           zIndex={1399}
//           onClick={onClose}
//         />
//       )}

//       <DialogRoot
//         open={open}
//         onOpenChange={(e) => {
//           if (!e.open) {
//             onClose();
//           }
//         }}
//         placement="center"
//         size="sm"
//       >
//         <DialogPositioner
//           position="fixed"
//           inset={0}
//           zIndex={1400}
//           display="flex"
//           alignItems="center"
//           justifyContent="center"
//           pointerEvents="none"
//         >
//           <DialogContent
//             pointerEvents="auto"
//             bg="white"
//             borderRadius="2xl"
//             border="1px solid"
//             borderColor="gray.100"
//             boxShadow="0 8px 40px rgba(0,0,0,0.12)"
//             maxW="360px"
//             w="full"
//             mx={4}
//           >
//             <DialogBody pt={5} pb={3}>
//               <Flex direction="column" align="center" gap={3}>
//                 {icon && (
//                   <Flex
//                     w="56px"
//                     h="56px"
//                     borderRadius="full"
//                     bg="gray.50"
//                     border="1px solid"
//                     borderColor="gray.100"
//                     justify="center"
//                     align="center"
//                   >
//                     {icon}
//                   </Flex>
//                 )}

//                 <Text
//                   fontSize="15px"
//                   fontWeight="600"
//                   color="gray.700"
//                   textAlign="center"
//                 >
//                   {title}
//                 </Text>

//                 <Text
//                   fontSize="13px"
//                   color="gray.500"
//                   textAlign="center"
//                   lineHeight="1.7"
//                 >
//                   {message}
//                 </Text>
//               </Flex>
//             </DialogBody>

//             <DialogFooter gap={2} px={5} pb={5}>
//               <Button
//                 flex={1}
//                 variant="outline"
//                 borderColor="gray.200"
//                 color="gray.500"
//                 borderRadius="lg"
//                 onClick={onClose}
//               >
//                 {cancelText}
//               </Button>

//               <Button
//                 flex={1}
//                 bg={confirmColor}
//                 color="white"
//                 borderRadius="lg"
//                 loading={loading}
//                 onClick={onConfirm}
//               >
//                 {confirmText}
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </DialogPositioner>
//       </DialogRoot>
//     </>
//   );
// };

// export default ConfirmDialog;

import React from "react";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  HStack,
  Portal,
  Text,
} from "@chakra-ui/react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "brand.500",
  icon,
  loading = false,
  loadingText,
}) => {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open && !loading) onClose();
      }}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop
          bg="blackAlpha.600"
          backdropFilter="blur(4px)"
          css={{
            "&[data-state='open']": {
              animation: "fadeIn 0.25s ease-out",
            },
            "&[data-state='closed']": {
              animation: "fadeOut 0.2s ease-in",
            },
            "@keyframes fadeIn": {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
            "@keyframes fadeOut": {
              from: { opacity: 1 },
              to: { opacity: 0 },
            },
          }}
        />
        <Dialog.Positioner>
          <Dialog.Content
            borderRadius="xl"
            boxShadow="0 20px 60px -12px rgba(6, 26, 56, 0.35)"
            border="1px solid"
            borderColor="gray.100"
            maxW="380px"
            w="full"
            overflow="hidden"
            css={{
              "&[data-state='open']": {
                animation: "popIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
              },
              "&[data-state='closed']": {
                animation: "popOut 0.18s ease-in forwards",
              },
              "@keyframes popIn": {
                from: { opacity: 0, transform: "scale(0.9) translateY(12px)" },
                to: { opacity: 1, transform: "scale(1) translateY(0)" },
              },
              "@keyframes popOut": {
                from: { opacity: 1, transform: "scale(1) translateY(0)" },
                to: { opacity: 0, transform: "scale(0.94) translateY(8px)" },
              },
            }}
          >
            {/* Accent bar biar konsisten sama Navbar */}
            <Box
              h="4px"
              w="full"
              bgGradient="to-r"
              gradientFrom="accent.400"
              gradientTo="brand.500"
            />

            <Box p={6}>
              <Flex justify="space-between" align="flex-start" mb={4}>
                <Flex
                  w="56px"
                  h="56px"
                  borderRadius="full"
                  bg="accent.50"
                  color="accent.500"
                  align="center"
                  justify="center"
                  flexShrink={0}
                  css={{
                    animation: open
                      ? "iconPop 0.4s 0.1s cubic-bezier(0.34, 1.56, 0.64, 1) both"
                      : undefined,
                    "@keyframes iconPop": {
                      from: {
                        opacity: 0,
                        transform: "scale(0.5) rotate(-8deg)",
                      },
                      to: { opacity: 1, transform: "scale(1) rotate(0deg)" },
                    },
                  }}
                >
                  {icon}
                </Flex>

                <Dialog.CloseTrigger asChild>
                  <CloseButton
                    size="sm"
                    color="gray.400"
                    disabled={loading}
                    _hover={{ bg: "gray.100", color: "gray.600" }}
                  />
                </Dialog.CloseTrigger>
              </Flex>

              <Dialog.Title asChild>
                <Text fontSize="16px" fontWeight="700" color="gray.900" mb={2}>
                  {title}
                </Text>
              </Dialog.Title>

              <Dialog.Description asChild>
                <Text fontSize="13.5px" color="gray.500" lineHeight="1.6">
                  {message}
                </Text>
              </Dialog.Description>

              <HStack mt={7} gap={3} justify="flex-end">
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="sm"
                  borderColor="gray.200"
                  color="gray.600"
                  borderRadius="md"
                  disabled={loading}
                  _hover={
                    loading ? {} : { bg: "gray.50", borderColor: "gray.300" }
                  }
                >
                  {cancelText}
                </Button>

                <Button
                  onClick={onConfirm}
                  size="sm"
                  borderRadius="md"
                  bg={confirmColor}
                  color="white"
                  minW="110px"
                  disabled={loading}
                  opacity={loading ? 0.85 : 1}
                  cursor={loading ? "not-allowed" : "pointer"}
                  _hover={loading ? {} : { filter: "brightness(0.94)" }}
                >
                  {loading ? (
                    <HStack gap={2}>
                      <Box
                        w="14px"
                        h="14px"
                        borderRadius="full"
                        border="2px solid"
                        borderColor="whiteAlpha.500"
                        borderTopColor="white"
                        css={{
                          animation: "spin 0.7s linear infinite",
                          "@keyframes spin": {
                            from: { transform: "rotate(0deg)" },
                            to: { transform: "rotate(360deg)" },
                          },
                        }}
                      />
                      <Text fontSize="13px">{loadingText ?? confirmText}</Text>
                    </HStack>
                  ) : (
                    confirmText
                  )}
                </Button>
              </HStack>
            </Box>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ConfirmDialog;
