import React, { useState } from "react";
import { Box } from "@chakra-ui/react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_WIDTH = 220;

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(true);

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Sidebar — selalu ada di DOM, animasi pakai translateX */}
      <Sidebar open={open} />

      {/* Main area — margin mengikuti state open */}
      <Box
        style={{
          marginLeft: open ? `${SIDEBAR_WIDTH}px` : "0px",
          transition: "margin-left 0.2s ease",
        }}
        minH="100vh"
        display="flex"
        flexDirection="column"
      >
        <Navbar onToggleSidebar={() => setOpen((v) => !v)} sidebarOpen={open} />{" "}
        <Box as="main" flex={1} p={{ base: 4, sm: 6, lg: 8 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
