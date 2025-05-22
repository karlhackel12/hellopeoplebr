
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

## Solução de problemas

### SDK Não Ativo

Se você receber a mensagem "SDK Not Active" no dashboard do Bugster, verifique:

1. **Conexão de rede**: Certifique-se de que sua aplicação tenha acesso à internet.
2. **Bloqueadores de conteúdo**: Desative bloqueadores de conteúdo ou adicione o domínio do Bugster à lista de exceções.
3. **CORS**: Verifique se não há problemas de CORS impedindo a comunicação com o servidor Bugster.
4. **API Key**: Confirme que a chave de API está correta no `BugsterProvider`.
5. **Firewall**: Verifique se o firewall ou proxy não está bloqueando as requisições para o endpoint do Bugster.

### Verificar manualmente a inicialização

Para verificar se o Bugster está inicializado e conectado corretamente:

1. Acesse a página inicial em modo de desenvolvimento para ver o componente de teste do Bugster.
2. Verifique o console do navegador para mensagens de erro ou logs do Bugster usando o botão "Verificar SDK no Console".
3. Use os botões de teste para verificar se os erros e mensagens estão sendo enviados.

### Verificar no dashboard

1. Verifique se os eventos de teste aparecem no dashboard do Bugster após alguns minutos.
2. Se não aparecerem, verifique as configurações de filtro no dashboard.

## Implementação Atual e Compatibilidade de Versões

Nossa implementação atual:

1. **Inicialização**: Usamos o construtor do Bugster diretamente `new BugsterTracker()` em vez do método estático `BugsterTracker.init()` mencionado na documentação.
2. **Verificação de métodos**: Implementamos verificações defensivas para cada método do SDK antes de usá-lo, com fallbacks para logging no console.
3. **Tratamento de erros**: Adicionamos tratamento robusto de erros para garantir que problemas com o SDK não afetem a aplicação.

Isso resolve problemas de compatibilidade entre diferentes versões da API do Bugster.

## Problemas comuns e soluções

**P: O que fazer quando o Bugster não está capturando erros?**
R: Verifique se o BugsterProvider está corretamente configurado no App.tsx e se você está usando o hook useBugsterTracker corretamente. Confira o console para qualquer erro.

**P: Por que o SDK mostra como inicializado mas não envia dados?**
R: Pode haver problemas de rede ou CORS. Verifique no console do navegador se há erros relacionados a requisições bloqueadas.

**P: Como depurar problemas de conexão?**
R: Use o componente BugsterTest em modo de desenvolvimento e clique em "Verificar SDK no Console" para inspecionar detalhes adicionais.

**P: Métodos do SDK não estão disponíveis?**
R: Nossa implementação verifica se os métodos existem antes de usá-los. Se métodos estiverem faltando, isso pode indicar uma incompatibilidade de versão ou inicialização incorreta.
