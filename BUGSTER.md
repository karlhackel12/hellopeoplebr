# Bugster SDK - Monitoramento de Erros

Este documento explica como usar o Bugster SDK integrado neste projeto para monitoramento de erros e diagnóstico de problemas.

## Configuração

O Bugster já está configurado no projeto através do `BugsterProvider` que envolve toda a aplicação. O SDK é inicializado automaticamente na inicialização do aplicativo.

## Como usar o Bugster em seus componentes

### 1. Importar o hook `useBugsterTracker`

```tsx
import { useBugsterTracker } from '@/hooks/useBugsterTracker';
```

### 2. Usar o hook no seu componente

```tsx
const { logError, logMessage, setUser } = useBugsterTracker();
```

### 3. Registrar erros

```tsx
try {
  // Código que pode gerar erro
} catch (error) {
  // Registra o erro no Bugster com contexto adicional
  logError(error, { 
    component: 'NomeDoComponente',
    action: 'nomeDaAção'
  });
}
```

### 4. Registrar mensagens (logs)

```tsx
// Registra uma mensagem informativa com contexto
logMessage('Operação concluída com sucesso', {
  component: 'NomeDoComponente',
  result: 'success',
  data: { id: 123 }
});
```

### 5. Identificar usuários

Para uma melhor experiência de depuração, você pode associar erros a usuários específicos:

```tsx
// Após o login bem-sucedido
setUser(userId, {
  email: userEmail,
  role: userRole,
  // Outros dados relevantes
});
```

## Exemplo prático

Veja o arquivo `src/pages/Dashboard.tsx` para um exemplo de como o Bugster foi implementado em um componente real do projeto.

## Boas práticas

1. **Adicione contexto aos erros**: Sempre forneça informações contextuais ao registrar erros para facilitar a depuração.
2. **Identifique o usuário**: Sempre que possível, associe os erros ao usuário atual.
3. **Estruture o contexto**: Use uma estrutura consistente para o contexto dos erros (ex: component, action, data).
4. **Não exponha dados sensíveis**: Nunca envie senhas, tokens ou dados pessoais sensíveis para o Bugster.

## Dashboard do Bugster

Você pode acessar o dashboard do Bugster para visualizar e analisar os erros em: [https://bugster.app](https://bugster.app)

## Perguntas frequentes

**P: O que fazer quando o Bugster não está capturando erros?**
R: Verifique se o BugsterProvider está corretamente configurado no App.tsx e se você está usando o hook useBugsterTracker corretamente. 