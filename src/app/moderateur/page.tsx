'use client';

import { useEffect, useState } from 'react';
import { FaCheck, FaEdit } from 'react-icons/fa'; // Icônes pour Confirmer et Modifier

type Term = {
  id: number;
  term: string;
  definition: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

const ModerateurPage = () => {
  const [terms, setTerms] = useState<Term[]>([]);

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const response = await fetch('/api/get-word');
      if (!response.ok) {
        throw new Error('Failed to fetch terms');
      }
      const data: Term[] = await response.json();
      console.log('Data from API:', data);
      setTerms(data);
    } catch (error) {
      console.error('Error fetching terms:', error);
    }
  };

  const confirmDefinition = async (id: number) => {
    try {
      const response = await fetch('/api/confirm-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        throw new Error('Failed to confirm definition');
      }
      fetchTerms();
    } catch (error) {
      console.error('Error confirming definition:', error);
    }
  };

  const updateDefinition = async (id: number, newDefinition: string) => {
    try {
      const response = await fetch('/api/update-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, definition: newDefinition }),
      });
      if (!response.ok) {
        throw new Error('Failed to update definition');
      }
      fetchTerms();
    } catch (error) {
      console.error('Error updating definition:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">Moderateur Interface</h1>
      <ul className="space-y-4">
        {terms.map((term) => (
          <li key={term.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <strong className="text-xl text-gray-800">{term.term}</strong>
                <p className="text-gray-600 mt-2">{term.definition}</p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => confirmDefinition(term.id)}
                  className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition duration-300"
                  title="Confirmer"
                >
                  <FaCheck className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const newDefinition = prompt('Entrez la nouvelle définition:', term.definition);
                    if (newDefinition) updateDefinition(term.id, newDefinition);
                  }}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300"
                  title="Modifier"
                >
                  <FaEdit className="w-5 h-5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ModerateurPage;