import FileUploadComponent from "./components/file-upload";
import ChatComponent from "./components/chat";
import Navbar from "./components/navbar";

export default function Home() {
  return (
    <div className="absolute h-screen w-screen overflow-hidden flex flex-col gap-2 lg:gap-8 justify-between bg-black">
      {/* Navbar */}
      <div className="relative h-[50px] lg:h-[60px] flex-shrink-0">
        <Navbar />
      </div>

      {/* Main content */}
      <div className="relative flex flex-1 overflow-hidden flex-col  lg:flex-row">
        {/* Upload Panel (super small on mobile) */}
        <div className="relative w-full flex-[0.6] lg:w-[30vw] lg:flex-none lg:h-full p-1 lg:p-4 flex justify-center items-center">
          <FileUploadComponent />
        </div>

        {/* Chat Panel (fills most of screen on mobile) */}
        <div className="w-full flex-1 lg:w-[70vw] lg:flex-1 lg:h-full border-none overflow-hidden rounded-2xl">
          <ChatComponent />
        </div>
      </div>
    </div>
  );
}
