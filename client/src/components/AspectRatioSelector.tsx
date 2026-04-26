import { Square, RectangleHorizontal, RectangleVertical } from 'lucide-react'
import React from 'react'
import { aspectRatios, type AspectRatio } from '../assets/assets'

const AspectRatioSelector = ({value, onChange}: {value: AspectRatio; onChange: (ratio: AspectRatio) => void}) => {
   const iconmap = {
      '16:9': <RectangleHorizontal className='size-6'/>,
      '1:1': <Square className='size-6'/>,
      '9:16': <RectangleVertical className='size-6'/>,
   } as Record<AspectRatio, React.ReactNode>
  return (
    <div className='space-y-2'>
      <label htmlFor="" className='block text-sm mb-2 font-medium'>Aspect Ratio</label>
      <div className='flex flex-wrap gap-2'>
         {aspectRatios.map((ratio) => {
            const selected = value === ratio;
            return (
               <button
                  key={ratio}
                  type='button'
                  onClick = {() => onChange(ratio)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${selected ? 'bg-white/10 text-white' : 'bg-black/20 text-white/50 border-white/10'}`}
               >
                  {iconmap[ratio]}
                  <span className='text-sm'>{ratio}</span>
               </button>
            )
         })}
      </div>
    </div>
  )
}

export default AspectRatioSelector
