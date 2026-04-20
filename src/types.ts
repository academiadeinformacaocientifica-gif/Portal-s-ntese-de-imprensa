/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = 'Política' | 'Economia' | 'Sociedade' | 'Cultura' | 'Saúde/IA' | 'Meio Ambiente';

export interface NewsMetadata {
  fonte: string;
  tiragem?: string;
  periodicidade: string;
  genero: string;
  formato: string;
  data: string;
  urlOriginal?: string;
}

export interface News {
  id: string;
  sinteseId: string;
  titulo: string;
  corpo: string;
  categoria: Category;
  imagemUrl?: string;
  metadata: NewsMetadata;
  ordem: number;
}

export interface Summary {
  id: string;
  dataReferencia: string;
  paisId: string;
  paisNome: string;
  tituloCapa: string;
  status: 'Hoje' | 'Ontem' | 'Arquivo';
  totalNoticias: number;
  categorias: Category[];
}

export interface Country {
  id: string;
  nome: string;
  flagCode: string;
}

export interface UserProfile {
  email: string;
  displayName: string;
  role: 'admin' | 'editor' | 'reader';
}
