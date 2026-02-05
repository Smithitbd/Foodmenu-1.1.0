import { useEffect, useRef, useState } from "react";

const AnimationWrapper = ({ children, className = "", animateClass = "animate" }) => {
  const ref = useRef();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const element = entries[0];

        if (element.isIntersecting) {
         
          setActive(true);

         
          setTimeout(() => {
            setActive(false);
          }, 1500);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${className} ${active ? animateClass : ""}`}>
      {children}
    </div>
  );
};

export default AnimationWrapper;
