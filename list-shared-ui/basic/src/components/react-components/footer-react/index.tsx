import React from 'react';
import textBurgerMenu from '../../../const/navbar/burger-menu-react.json';
import contentFooter from '../../../const/footer/footer.json';
import PropsLogoNavbar from '../../../const/navbar/logo.json';
import LinksListFooterReact from './footer-links-react';
import FooterBoxLinks from './footer-box-links';
import { DevelopedBy } from './developed-by';

const FooterReact: React.FC = () => {
    return (
        <div
            className='p-8'
            id="footer"
            style={{
                color: contentFooter?.textColorFooter,
                background: contentFooter?.bgFooter,
                borderRadius: contentFooter?.isRoundedFooter ? "50px" : "0px",
            }}
        >
            <div className="flex justify-center w-full mb-8">
                <div className="text-center">
                    <p className="text-sm font-syne font-bold">
                        {textBurgerMenu.BurgerMenu.main_burger_subtitle.title}
                    </p>
                    <p className="text-lg font-syne font-bold lowercase underline">
                        {textBurgerMenu.BurgerMenu.email.title}
                    </p>
                </div>
            </div>
            <div className="flex justify-center w-full">
                    <FooterBoxLinks />
                </div>


            <div className="flex flex-col md:flex-row justify-between gap-10 items-center">
                <div >
                    <a href="/">
                        <img 
                            className="w-36 rounded-md" 
                            src="/logo.svg"
                            width={PropsLogoNavbar.widthLogo} 
                            height={PropsLogoNavbar.heightLogo}     
                            alt="Главная страница" 
                        />
                    </a>
                </div>
                
                <div>
                    <p className="text-md font-syne font-bold">
                        <a href='/'>
                            {textBurgerMenu.BurgerMenu.main_burger.title}
                        </a>
                    </p>
                </div>
            </div>

            <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

            <p className="text-md font-syne font-bold text-center">
                &copy; {new Date().getFullYear()} {contentFooter.titleFooter}
            </p>

            <div>
                <LinksListFooterReact />
            </div>
            <DevelopedBy />
        </div>
    );
}

export default FooterReact;
