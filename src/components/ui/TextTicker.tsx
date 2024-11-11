'use client';

const TextTicker = () => {
  const items = [
    "Online Banking",
    "24hr Support", 
    "Easy Banking",
    "Dollar Cards",
    "Zero Decline Fees",
    "Easy Account Opening"
  ];

  return (
    <div className="max-w-[1404px] mx-auto bg-[#EBEBED] overflow-hidden h-[72px] flex items-center px-20 rounded-[100px] relative">
      {/* Fade effect at start */}
      <div className="absolute left-0 w-20 h-full bg-gradient-to-r from-[#EBEBED] to-transparent z-10" />
      
      <div className="flex items-center animate-[ticker_30s_linear_infinite]">
        {/* Repeat items infinitely */}
        {[...items, ...items, ...items, ...items].map((item, index) => (
          <div key={index} className="flex items-center whitespace-nowrap">
            <span className="font-redhat text-[20px]">{item}</span>
            {/* Add star after each item */}
            <img src="/star2.svg" alt="" className="w-6 h-6 mx-8" />
          </div>
        ))}
      </div>

      {/* Fade effect at end */}
      <div className="absolute right-0 w-20 h-full bg-gradient-to-l from-[#EBEBED] to-transparent z-10" />
    </div>
  );
};

export default TextTicker;