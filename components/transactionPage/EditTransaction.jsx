import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { TbEdit } from 'react-icons/tb';
import axios from 'axios';
import useUpdateTransactions from '@/app/hooks/useUpdateTransactions';

const formatRupiah = (value) => {
  if (!value) return '';
  return parseInt(value.replace(/\D/g, ''), 10).toLocaleString('id-ID');
};

const EditTransaction = ({ id, amount, description, transactionType, currentPage }) => {
  const [moneyValueInput, setMoneyValueInput] = useState(formatRupiah(amount.toString()));
  const [descriptionInput, setDescriptionInput] = useState(description);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateTransactions = useUpdateTransactions();

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}`,
        {
          amount: Number(moneyValueInput.replace(/\./g, '')),
          description: descriptionInput,
          transactionType,
        },
        {
          withCredentials: true,
        }
      );

      updateTransactions(transactionType, currentPage);

      setIsOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoneyValueInputChanges = (e) => {
    let rawValue = e.target.value.replace(/\D/g, '');
    let numericValue = Number(rawValue);

    if (numericValue > 1_000_000_000_000) {
      numericValue = 1_000_000_000_000;
    }

    setMoneyValueInput(formatRupiah(numericValue.toString()));
  };

  const handledescriptionInputChanges = (e) => {
    setDescriptionInput(e.target.value);
  };

  const handleSetDefaultInput = () => {
    setMoneyValueInput(formatRupiah(amount.toString()));
    setDescriptionInput(description);
  };

  const handleOpenChange = () => setIsOpen((prevState) => !prevState);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className='text-xl text-white bg-[#4D4FED] text-[1rem]' onClick={handleSetDefaultInput}>
          Edit
          <TbEdit size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[450px] rounded-lg shadow-xl p-6'>
        <DialogHeader>
          <DialogTitle className='text-lg font-semibold text-gray-800'>Ubah Transaksi</DialogTitle>
          <DialogDescription className='text-sm text-gray-600 mt-1'>
            Silakan ubah detail transaksi lalu tekan <b>"Ubah transaksi!"</b>
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 mt-4'>
          <div>
            <Label htmlFor='moneyValue' className='text-sm font-medium text-gray-700'>
              Jumlah Uang
            </Label>
            <Input 
              id='moneyValue' 
              onChange={handleMoneyValueInputChanges} 
              value={moneyValueInput} 
              className='mt-2 w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-[#4D4FED] focus:outline-none transition-all'
              type='text' 
              placeholder='Masukkan jumlah uang'
            />
          </div>
          <div>
            <Label htmlFor='description' className='text-sm font-medium text-gray-700'>
              Deskripsi
            </Label>
            <textarea
              onChange={handledescriptionInputChanges}
              value={descriptionInput}
              className='w-full mt-2 px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-[#4D4FED] focus:outline-none transition-all resize-none h-24 placeholder-gray-400'
              id='description'
              placeholder='Tambahkan deskripsi transaksi'
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between items-center mt-6">
          <Button 
            onClick={() => setIsOpen(false)} 
            className="bg-gray-300 text-gray-800 font-semibold px-5 py-2 rounded-md transition-all"
          >
            Batal
          </Button>
          <Button 
            onClick={handleSaveChanges} 
            disabled={isLoading}
            className={`px-5 py-2 rounded-md font-semibold transition-all ${
              isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'shadow-md'
            }`}
          >
            {isLoading ? 'Menyimpan...' : 'Ubah transaksi!'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTransaction;
