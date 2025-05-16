/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropTable
DROP TABLE [dbo].[User];

-- CreateTable
CREATE TABLE [dbo].[Users] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000),
    [name] NVARCHAR(1000) NOT NULL,
    [tipoEmpresa] NVARCHAR(1000),
    [cnpj] NVARCHAR(1000),
    [nomeFantasia] NVARCHAR(1000),
    [razaoSocial] NVARCHAR(1000),
    [cpf] NVARCHAR(1000),
    [cep] NVARCHAR(1000),
    [endereco] NVARCHAR(1000),
    [numero] NVARCHAR(1000),
    [complemento] NVARCHAR(1000),
    [imageBase64] NVARCHAR(1000),
    [canCadastrarItem] BIT NOT NULL CONSTRAINT [Users_canCadastrarItem_df] DEFAULT 0,
    [canMinhaEmpresa] BIT NOT NULL CONSTRAINT [Users_canMinhaEmpresa_df] DEFAULT 0,
    [canGerenciarItens] BIT NOT NULL CONSTRAINT [Users_canGerenciarItens_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Users_email_key] UNIQUE NONCLUSTERED ([email]),
    CONSTRAINT [Users_cnpj_key] UNIQUE NONCLUSTERED ([cnpj]),
    CONSTRAINT [Users_cpf_key] UNIQUE NONCLUSTERED ([cpf])
);

-- CreateTable
CREATE TABLE [dbo].[LinkedAccounts] (
    [id] INT NOT NULL IDENTITY(1,1),
    [provider] NVARCHAR(1000) NOT NULL,
    [providerAccountId] NVARCHAR(1000) NOT NULL,
    [userId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [LinkedAccounts_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [LinkedAccounts_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [LinkedAccounts_provider_providerAccountId_key] UNIQUE NONCLUSTERED ([provider],[providerAccountId])
);

-- AddForeignKey
ALTER TABLE [dbo].[LinkedAccounts] ADD CONSTRAINT [LinkedAccounts_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
