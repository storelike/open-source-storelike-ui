import React from 'react';

interface Link {
  path: string;
  label: string;
  is_active: boolean;
  badge?: boolean;
  titleBadge?: string;
}

interface PhoneNavProps {
  data: {
    bgNavbar: string;
    textColorNavbar: string;
    roundedNavbar: boolean;
    bgBurger: string;
    textColorBurger: string;
    links: Link[];
  };
}

const PhoneNav: React.FC<PhoneNavProps> = ({ data }) => {  
  const phoneLink:any = data.links.find(link => link.path.startsWith('tel:'));
  if (!phoneLink && phoneLink.is_active) {
    return null;
  }

  return (
    <div className="flex items-center justify-center p-2 md:hidden"> 
      <div 
  className="border border-gray-300 rounded-lg px-[clamp(8px,2vw,16px)] py-[clamp(4px,1vw,10px)] bg-transparent text-gray-800 shadow-md max-w-[clamp(120px,40vw,200px)]"
>
  <a 
    href={phoneLink.path}
    className="block font-bold hover:shadow-lg hover:scale-110 text-[clamp(10px,2vw,18px)] whitespace-nowrap"
  >
    {phoneLink.label}
  </a>
</div>

    </div>
  );
};

export default PhoneNav;
