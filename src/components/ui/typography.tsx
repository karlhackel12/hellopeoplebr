
import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export function H1({ children, className }: TypographyProps) {
  return (
    <h1 className={cn('heading-1', className)}>
      {children}
    </h1>
  );
}

export function H2({ children, className }: TypographyProps) {
  return (
    <h2 className={cn('heading-2', className)}>
      {children}
    </h2>
  );
}

export function H3({ children, className }: TypographyProps) {
  return (
    <h3 className={cn('heading-3', className)}>
      {children}
    </h3>
  );
}

export function H4({ children, className }: TypographyProps) {
  return (
    <h4 className={cn('heading-4', className)}>
      {children}
    </h4>
  );
}

export function BodyLarge({ children, className }: TypographyProps) {
  return (
    <p className={cn('body-large', className)}>
      {children}
    </p>
  );
}

export function BodyNormal({ children, className }: TypographyProps) {
  return (
    <p className={cn('body-normal', className)}>
      {children}
    </p>
  );
}

export function BodySmall({ children, className }: TypographyProps) {
  return (
    <p className={cn('body-small', className)}>
      {children}
    </p>
  );
}

export function Handwriting({ children, className }: TypographyProps) {
  return (
    <span className={cn('handwriting', className)}>
      {children}
    </span>
  );
}
