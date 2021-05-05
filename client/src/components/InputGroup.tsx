import classNames from 'classnames';

interface InputGroupProps {
	className?: string;
	type: string;
	name: string;
	placeholder: string;
	value: string;
	error: string | undefined;
	onChange: any;
}

const InputGroup: React.FC<InputGroupProps> = ({
	className,
	type,
	placeholder,
	value,
	error,
	name,
	onChange,
}) => {
	return (
		<div className={className}>
			<input
				type={type}
				className={classNames(
					'w-full px-3 py-2 transition duration-200 bg-gray-100 border border-gray-300 outline-none rounded focus:bg-white hover:bg-white',
					{ 'border border-red-500': error },
				)}
				placeholder={placeholder}
				name={name}
				value={value}
				onChange={onChange}
			/>
			<small className='font-medium text-red-600'>{error}</small>
		</div>
	);
};

export default InputGroup;
