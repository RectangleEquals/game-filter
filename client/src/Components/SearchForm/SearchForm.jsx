import { Container } from 'react-bootstrap';
import DynamicFields from './DynamicFields';
import { GiBulletBill } from 'react-icons/gi';

function SearchForm() {
  return(
    <Container>
      <h2 className='text-capitalize text-light text-center'>Add logic to filter search results</h2>
      <h5 className='text-secondary text-center'><GiBulletBill className='me-2 text-light'/>Each existing row of logic is executed in sequence</h5>
      <h5 className='text-secondary text-center'><GiBulletBill className='me-2 text-light'/>You can drag & drop rows to prioritize logic order</h5>
      <h5 className='text-secondary text-center'><GiBulletBill className='me-2 text-light'/>To remove a row, drag & drop it outside of the list</h5>
      <DynamicFields className="flex d-flex align-items-center" />
    </Container>
  );
}

export default SearchForm;