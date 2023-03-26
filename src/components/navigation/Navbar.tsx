import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
	return (
		<nav className='w-full px-5 sm:h-20 bg-zinc-50 flex flex-col sm:flex-row py-2 sm:py-0 gap-2 sm:gap-0 place-items-center place-content-between'>
			<Link href={'/'}>
				<div className='text-2xl font-semibold cursor-pointer select-none flex place-items-center uppercase gap-2'>
					<Image alt='icon' src={'/images/android-chrome-192x192.png'} width={40} height={40} />
					Hljóðstafir
				</div>
			</Link>
		</nav>
	);
};

export default Navbar;