/**
 * Common icon components and utilities
 * Centralized icon imports to reduce repetition across components
 */

// React Icons - HeroIcons
export {
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineExclamation,
  HiOutlineCheckCircle,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineCalendar,
  HiOutlineCloudUpload,
  HiOutlineDocumentDownload,
  HiOutlineShoppingBag,
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineTrash,
  HiOutlineMenu,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlinePhotograph,
  HiOutlineCamera,
  HiOutlineTag,
  HiOutlineX,
  HiOutlineHeart,
  HiHeart,
  HiDownload,
  HiTrash,
  HiPaperAirplane,
  HiOutlineChatAlt2,
  HiX,
  HiOutlineArrowUp
} from 'react-icons/hi';

// React Icons - Material Design
export {
  MdClear,
  MdDeleteOutline,
  MdSave,
  MdCloudDownload,
  MdDownload,
  MdClose,
  MdShoppingCart,
  MdAddShoppingCart,
  MdCalendarToday,
  MdViewWeek,
  MdViewDay,
  MdSettings,
  MdAdd,
  MdExpandMore,
  MdExpandLess,
  MdList,
  MdDragIndicator,
  MdAccessTime,
  MdPeople,
  MdAddCircleOutline,
  MdDelete,
  MdDeleteSweep
} from 'react-icons/md';

// React Icons - Feather
export {
  FiLock,
  FiUnlock
} from 'react-icons/fi';

// React Icons - Ant Design
export {
  AiOutlineLoading
} from 'react-icons/ai';

// React Icons - Remix
export {
  ImSpinner2
} from 'react-icons/im';

// Common SVG icons as components
export const CheckCircleOutlineIcon = ({ className = "h-16 w-16 text-emerald-500 mb-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const PlusIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

export const CloseIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const ArrowRightIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

export default {
  CheckCircleOutlineIcon,
  PlusIcon,
  CloseIcon,
  ArrowRightIcon
};
