import React from 'react'

interface SwitchButtonProps {
  handleClick: (switchTo: string) => void
  switchTo: string
  showing: string
  title: string
  rounded: 'right' | 'left' | 'none'
}

const SwitchButton = ({
  handleClick,
  switchTo,
  showing,
  title,
  rounded
}: SwitchButtonProps) => {
  return (
    <button
      onClick={() => handleClick(switchTo)}
      className={`px-4 py-2 ${rounded === 'right' ? 'rounded-r-sm' : rounded === 'left' ? 'rounded-l-sm' : ''} ${
        showing === switchTo
          ? 'underline decoration-2 text-white decoration-white bg-primary'
          : 'bg-gray-200 hover:bg-gray-100'
      }`}
    >
      {title}
    </button>
  )
}

export default SwitchButton