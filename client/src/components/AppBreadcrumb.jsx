import { FaHome, FaEdit, FaCheckCircle, FaEye } from "react-icons/fa";
import { HiArrowRight } from "react-icons/hi";

const steps = [
  { label: "Start", icon: FaHome },
  { label: "Auswählen", icon: FaEye },
  { label: "Anpassen", icon: FaEdit },
  { label: "Fertig", icon: FaCheckCircle },
];

const AppBreadcrumb = ({ activeIndex }) => {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-y-1 text-sm">
      {steps.map((step, idx) => {
        let iconColor, bgColor, textColor;
        if (idx > activeIndex) {
          iconColor = "text-gray-400 dark:text-gray-500";
          bgColor = "bg-gray-100 dark:bg-gray-700";
          textColor = "text-gray-400 dark:text-gray-500";
        } else if (idx === activeIndex) {
          iconColor = "text-gray-500 dark:text-gray-100";
          bgColor = "bg-blue-100 dark:bg-blue-800";
          textColor = "text-blue-600 dark:text-blue-300";
        } else {
          iconColor = "text-gray-500 dark:text-gray-100";
          bgColor = "bg-gray-100 dark:bg-gray-700";
          textColor = "text-gray-700 dark:text-gray-100";
        }

        const Icon = step.icon;

        return (
          <li className="flex items-center " key={step.label}>
            <span className="flex flex-col items-center select-none">
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColor} transition`}
              >
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </span>
              <span className={`mt-1 text-xs font-semibold ${textColor}`}>
                {step.label}
              </span>
            </span>
            {idx < steps.length - 1 && (
              <HiArrowRight className="w-4 h-4 mr-2 ml-2 text-gray-400 dark:text-gray-500" />
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default AppBreadcrumb;
