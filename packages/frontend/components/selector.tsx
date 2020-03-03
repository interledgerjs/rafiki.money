import Select from 'react-select'

const options = [
  { label: 'Cheque '},
  { label: 'Savings' }
]

  // light mode only
  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: 56,
      minHeight: 56,
      '&:hover': {
        borderColor: 0,
        borderWidth: 2 
      },
      boxShadow: state.isFocused ? '#FF8A65' : 0,
      borderColor: state.isFocused? '#FF8A65': 'rgba(0, 0, 0, .12)',
      borderWidth: state.isFocused? 2 : 1,
    }), option: (styles) => ({
       ...styles,
       backgroundColor: 'transparent',
       color: 'black',
       '&:hover': {
        backgroundColor: '#FFCCBC'
      },
      })
  }

  const Selector = () => (
    
    <Select options={options}
    styles={customStyles}/>
  )

  export default Selector
