import {
  FaHome,
  FaGithub,
  FaUserClock,
  FaSignOutAlt
} from "react-icons/fa";

export default function Sidebar() {

  return (

    <div className="
      fixed
      left-0
      top-0
      h-screen
      w-[260px]
      bg-white/10
      backdrop-blur-xl
      border-r
      border-white/10
      text-white
      p-6
    ">

      <h1 className="
        text-3xl
        font-bold
        mb-12
      ">
        AttendancePro
      </h1>

      <div className="
        flex
        flex-col
        gap-6
      ">

        <div className="
          flex
          items-center
          gap-3
          hover:text-blue-400
          transition
          cursor-pointer
        ">
          <FaHome />
          <span>Dashboard</span>
        </div>

        <div className="
          flex
          items-center
          gap-3
          hover:text-blue-400
          transition
          cursor-pointer
        ">
          <FaUserClock />
          <span>Attendance</span>
        </div>

        <div className="
          flex
          items-center
          gap-3
          hover:text-blue-400
          transition
          cursor-pointer
        ">
          <FaGithub />
          <span>GitHub</span>
        </div>

        <div className="
          flex
          items-center
          gap-3
          mt-20
          hover:text-red-400
          transition
          cursor-pointer
        ">
          <FaSignOutAlt />
          <span>Logout</span>
        </div>

      </div>

    </div>
  );
}