// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {} from '@fortawesome/free-brands-svg-icons'
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons';
// import {} from '@fortawesome/free-solid-svg-icons';

// Icon mapping
const iconMap = { faCircleXmark };

const Icon = ({ style, icon, onClick }) => {
  const selected = iconMap[icon];
  return (
    <FontAwesomeIcon className={style} icon={selected} onClick={onClick} />
  );
};

export default Icon;
