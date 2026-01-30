import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateDishForm } from './CreateDishForm';
import type { Dish } from '../types';

describe('CreateDishForm', () => {
  const mockOnSave = vi.fn();
  const mockOnCancelEdit = vi.fn();

  const defaultProps = {
    dishes: [] as Dish[],
    onSave: mockOnSave,
    editingDish: null,
    onCancelEdit: mockOnCancelEdit,
  };

  const existingDish: Dish = {
    id: 'dish-1',
    name: 'Existing Dish',
    ingredients: {
      'Fruit shop': ['Apple'],
      'Butchery': [],
      'Supermarket': ['Pasta'],
    },
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the form with all category sections', () => {
      render(<CreateDishForm {...defaultProps} />);

      expect(screen.getByLabelText(/dish name/i)).toBeInTheDocument();
      expect(screen.getByText(/fruit shop/i)).toBeInTheDocument();
      expect(screen.getByText(/butchery/i)).toBeInTheDocument();
      expect(screen.getByText(/supermarket/i)).toBeInTheDocument();
    });

    it('shows "Save Dish" button when not editing', () => {
      render(<CreateDishForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /save dish/i })).toBeInTheDocument();
    });

    it('shows "Update Dish" and "Cancel" buttons when editing', () => {
      render(<CreateDishForm {...defaultProps} editingDish={existingDish} />);

      expect(screen.getByRole('button', { name: /update dish/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('form input', () => {
    it('allows entering a dish name', async () => {
      const user = userEvent.setup();
      render(<CreateDishForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/dish name/i);
      await user.type(nameInput, 'My New Dish');

      expect(nameInput).toHaveValue('My New Dish');
    });

    it('populates form when editing a dish', () => {
      render(<CreateDishForm {...defaultProps} editingDish={existingDish} />);

      expect(screen.getByLabelText(/dish name/i)).toHaveValue('Existing Dish');
    });
  });

  describe('validation', () => {
    it('shows error when submitting with empty name', async () => {
      const user = userEvent.setup();
      render(<CreateDishForm {...defaultProps} />);

      // Add an ingredient so that's not the error
      const fruitInput = screen.getByPlaceholderText(/add fruit shop ingredient/i);
      await user.type(fruitInput, 'Apple');

      // Submit without a name
      await user.click(screen.getByRole('button', { name: /save dish/i }));

      expect(screen.getByText(/dish name is required/i)).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('shows error when submitting with no ingredients', async () => {
      const user = userEvent.setup();
      render(<CreateDishForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/dish name/i);
      await user.type(nameInput, 'My Dish');

      await user.click(screen.getByRole('button', { name: /save dish/i }));

      expect(screen.getByText(/at least one ingredient is required/i)).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('shows error for duplicate dish name', async () => {
      const user = userEvent.setup();
      const dishes = [existingDish];

      render(<CreateDishForm {...defaultProps} dishes={dishes} />);

      const nameInput = screen.getByLabelText(/dish name/i);
      await user.type(nameInput, 'Existing Dish');

      const fruitInput = screen.getByPlaceholderText(/add fruit shop ingredient/i);
      await user.type(fruitInput, 'Banana');

      await user.click(screen.getByRole('button', { name: /save dish/i }));

      expect(screen.getByText(/a dish with this name already exists/i)).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('form submission', () => {
    it('calls onSave with correct data when form is valid', async () => {
      const user = userEvent.setup();
      render(<CreateDishForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/dish name/i);
      await user.type(nameInput, 'My New Dish');

      const fruitInput = screen.getByPlaceholderText(/add fruit shop ingredient/i);
      await user.type(fruitInput, 'Apple');

      await user.click(screen.getByRole('button', { name: /save dish/i }));

      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'My New Dish',
        ingredients: {
          'Fruit shop': ['Apple'],
          'Butchery': [],
          'Supermarket': [],
        },
      });
    });

    it('trims whitespace from name and ingredients', async () => {
      const user = userEvent.setup();
      render(<CreateDishForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/dish name/i);
      await user.type(nameInput, '  Spaced Name  ');

      const fruitInput = screen.getByPlaceholderText(/add fruit shop ingredient/i);
      await user.type(fruitInput, '  Spaced Ingredient  ');

      await user.click(screen.getByRole('button', { name: /save dish/i }));

      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'Spaced Name',
        ingredients: {
          'Fruit shop': ['Spaced Ingredient'],
          'Butchery': [],
          'Supermarket': [],
        },
      });
    });

    it('resets form after successful submission', async () => {
      const user = userEvent.setup();
      render(<CreateDishForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/dish name/i);
      await user.type(nameInput, 'My Dish');

      const fruitInput = screen.getByPlaceholderText(/add fruit shop ingredient/i);
      await user.type(fruitInput, 'Apple');

      await user.click(screen.getByRole('button', { name: /save dish/i }));

      expect(nameInput).toHaveValue('');
    });
  });

  describe('editing', () => {
    it('allows updating a dish with the same name', async () => {
      const user = userEvent.setup();
      const dishes = [existingDish];

      render(
        <CreateDishForm
          {...defaultProps}
          dishes={dishes}
          editingDish={existingDish}
        />
      );

      // Just update an ingredient, keep the same name
      const butcheryInput = screen.getByPlaceholderText(/add butchery ingredient/i);
      await user.type(butcheryInput, 'Chicken');

      await user.click(screen.getByRole('button', { name: /update dish/i }));

      expect(mockOnSave).toHaveBeenCalled();
    });

    it('calls onCancelEdit when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<CreateDishForm {...defaultProps} editingDish={existingDish} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockOnCancelEdit).toHaveBeenCalled();
    });

    it('resets form when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<CreateDishForm {...defaultProps} editingDish={existingDish} />);

      const nameInput = screen.getByLabelText(/dish name/i);
      expect(nameInput).toHaveValue('Existing Dish');

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(nameInput).toHaveValue('');
    });
  });
});
