'use client';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import Marquee from "@/components/magicui/marquee";

const reviews = [
  {
    name: "Chinedu A.",
    username: "Student", 
    body: "Nyra has made sending money to my girls so easy. Cuz me i don't like stress.",
    img: "/avatar.png",
  },
  {
    name: "Sarah M.",
    username: "Student",
    body: "Nyra has made sending money to my girls so easy. Cuz me i don't like stress.",
    img: "/avatar.png",
  },
  {
    name: "John D.",
    username: "Student",
    body: "Nyra has made sending money to my girls so easy. Cuz me i don't like stress.",
    img: "/avatar.png",
  },
];

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure className={cn(
      "relative w-[400px] overflow-hidden rounded-[32px] bg-white p-8 shadow-sm mx-3",
    )}>
      <div className="mb-6">
        <img src="/quote.svg" alt="Quote" className="w-8 h-8" />
      </div>
      <blockquote className="text-xl mb-6">{body}</blockquote>
      <div className="flex items-center gap-3">
        <img className="rounded-full w-12 h-12" alt={name} src={img} />
        <div>
          <figcaption className="font-medium">{name}</figcaption>
          <p className="text-gray-500">{username}</p>
        </div>
      </div>
    </figure>
  );
};

const Testimonial = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-24">
      <div className="mb-16">
        <motion.span 
          className="bg-[#EBEBED] px-4 py-2 rounded-full text-sm font-medium text-gray-500 inline-block mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          WHY NYRA
        </motion.span>
        
        <motion.h2 
          className="text-[100px] leading-[1.1]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center">
            <div className="relative h-[100px] overflow-hidden">
              <motion.div
                initial={{ y: 0 }}
                animate={{ 
                  y: [-100, -200, -300, 0]
                }}
                transition={{
                  duration: 3,
                  times: [0, 0.33, 0.66, 1],
                  ease: [0.87, 0, 0.13, 1],
                  repeat: Infinity,
                }}
              >
                <div className="h-[100px] flex items-center">
                  <span className="text-gray-400 text-[80px] font-thin">Safe and secure?</span>
                </div>
                <div className="h-[100px] flex items-center">
                  <span className="text-gray-400 text-[80px] font-thin">Fast and secure?</span>
                </div>
                <div className="h-[100px] flex items-center">
                  <span className="text-gray-400 text-[80px] font-thin">Safe and secure?</span>
                </div>
                <div className="h-[100px] flex items-center">
                  <span className="text-gray-400 text-[80px] font-thin">Cute and demure?</span>
                </div>
              </motion.div>
            </div>
            <span className="text-[80px] font-thin ml-4">Like mad</span>
          </div>
        </motion.h2>
      </div>

      <div className="relative">
        <Marquee pauseOnHover className="[--duration:30s]">
          {reviews.map((review) => (
            <ReviewCard key={review.name} {...review} />
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#F5F5F6]"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#F5F5F6]"></div>
      </div>
    </section>
  );
};

export default Testimonial;
