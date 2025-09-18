import FileUploadComponent from "./components/file-upload";
import ChatComponent from "./components/chat";
import Navbar from "./components/navbar";

export default function Home() {
  return (
    <div className="h-[89vh] w-screen overflow-hidden flex flex-col bg-gradient-to-br from-black via- -900 to-black">
      {/* Navbar */}
       

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Left Panel */}
        <div className="w-full lg:w-[30vw] h-[40vh] lg:h-full p-4 flex justify-center items-center">
          <FileUploadComponent />
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-[70vw] h-[60vh] lg:h-full border-none overflow-hidden rounded-2xl">
          <ChatComponent />
        </div>
      </div>
    </div>
  );
}
