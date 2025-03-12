import React from 'react';
import PropTypes from 'prop-types';

function TransactionEntry(props) {
  return (
    <div className='flex justify-between items-center gap-4 text-sm'>
      <div>
        <p className='font-semibold'>Pemasukan</p>
        <p>Deskripsi Pemasukan 1</p>
      </div>
      <div className='font-semibold'>
        <p>+ Rp. 200.000</p>
      </div>
    </div>
  );
}

TransactionEntry.propTypes = {};

export default TransactionEntry;
